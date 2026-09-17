import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import db
from models import Job, JobStage, ProductionSheetEntry, AuditLog
from utils.jwt import token_required

jobs_bp = Blueprint('jobs', __name__)

STAGE_KEYS = ['blending', 'path1', 'path2', 'editor1', 'editor2', 'lc', 'qc', 'fc']

def safe_int(val, default=0):
    try:
        if val is None or val == '':
            return default
        return int(val)
    except (ValueError, TypeError):
        return default

def log_audit(user, action, details=""):
    try:
        log = AuditLog(
            user_email=user.email,
            user_name=user.name or user.email,
            action=action,
            details=details
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print("Audit log error:", e)


@jobs_bp.route('', methods=['GET'])
def get_jobs():
    jobs = Job.query.order_by(Job.created_at.desc()).all()
    return jsonify({'jobs': [j.to_dict() for j in jobs]})


@jobs_bp.route('', methods=['POST'])
@token_required
def create_job():
    user = request.current_user
    data = request.get_json() or {}
    job_number = str(data.get('jobNumber') or data.get('id') or f"{int(datetime.utcnow().timestamp())}")
    client_code = (data.get('client') or data.get('clientCode') or 'BE').strip().upper()
    service = (data.get('name') or data.get('service') or 'Untitled Job').strip()
    files_count = safe_int(data.get('files') or data.get('outputTarget'), 0)
    output_target = safe_int(data.get('outputTarget'), files_count)

    existing = Job.query.filter_by(job_number=job_number).first()
    if existing:
        return jsonify({'message': f'Job #{job_number} already exists.'}), 409

    job = Job(
        job_number=job_number,
        client_code=client_code,
        service=service,
        files_count=files_count,
        output_target=output_target,
        status='In Progress',
        client_entry_time=data.get('clientEntryTime'),
        client_target_time=data.get('clientTargetTime'),
        client_finish_time=data.get('clientFinishTime')
    )
    db.session.add(job)
    db.session.flush()

    # Create all 8 possible stages
    stages_data = data.get('stages') or {}
    for key in STAGE_KEYS:
        st = stages_data.get(key) or {}
        assignee = st.get('assignee') or data.get(f'{key}Assignee') or ''
        files_for_stage = safe_int(st.get('filesCount') or data.get(f'{key}Files'), output_target if assignee else 0)
        stage = JobStage(
            job_id=job.id,
            stage_key=key,
            assignee=assignee,
            status=st.get('status') or ('Pending' if assignee else 'Unassigned'),
            files_count=files_for_stage,
            output_count=safe_int(st.get('outputCount'), 0),
            start_time=st.get('startTime'),
            end_time=st.get('endTime'),
            paused_duration_seconds=safe_int(st.get('pausedDurationSeconds'), 0),
            current_pause_start=st.get('currentPauseStart'),
            pause_logs_json=json.dumps(st.get('pauseLogs') or [])
        )
        db.session.add(stage)

    db.session.commit()
    log_audit(user, 'JOB_CREATED', f"Created Job #{job_number} for client {client_code}")
    return jsonify({'message': 'Job created successfully', 'job': job.to_dict()}), 201


@jobs_bp.route('/<string:job_identifier>', methods=['PUT'])
@token_required
def update_job(job_identifier):
    user = request.current_user
    try:
        int_id = int(job_identifier)
    except (ValueError, TypeError):
        int_id = -1
    job = Job.query.filter((Job.job_number == str(job_identifier)) | (Job.id == int_id)).first()
    if not job:
        return jsonify({'message': 'Job not found'}), 404

    data = request.get_json() or {}
    if 'status' in data:
        job.status = data['status']
    if 'name' in data:
        job.service = data['name']
    elif 'service' in data:
        job.service = data['service']
    if 'client' in data:
        job.client_code = data['client'].strip().upper()
    if 'outputTarget' in data:
        job.output_target = safe_int(data['outputTarget'], job.output_target or 0)
    if 'clientEntryTime' in data:
        job.client_entry_time = data['clientEntryTime']
    if 'clientTargetTime' in data:
        job.client_target_time = data['clientTargetTime']
    if 'clientFinishTime' in data:
        job.client_finish_time = data['clientFinishTime']

    stages_data = data.get('stages')
    if isinstance(stages_data, dict):
        for key, st in stages_data.items():
            if key in STAGE_KEYS:
                stage_obj = JobStage.query.filter_by(job_id=job.id, stage_key=key).first()
                if not stage_obj:
                    stage_obj = JobStage(job_id=job.id, stage_key=key)
                    db.session.add(stage_obj)
                stage_obj.assignee = st.get('assignee', stage_obj.assignee)
                stage_obj.status = st.get('status', stage_obj.status)
                stage_obj.files_count = safe_int(st.get('filesCount'), stage_obj.files_count or 0)
                stage_obj.output_count = safe_int(st.get('outputCount'), stage_obj.output_count or 0)
                stage_obj.start_time = st.get('startTime', stage_obj.start_time)
                stage_obj.end_time = st.get('endTime', stage_obj.end_time)
                stage_obj.paused_duration_seconds = safe_int(st.get('pausedDurationSeconds'), stage_obj.paused_duration_seconds or 0)
                stage_obj.current_pause_start = st.get('currentPauseStart', stage_obj.current_pause_start)
                if 'pauseLogs' in st:
                    stage_obj.pause_logs_json = json.dumps(st['pauseLogs'])

    db.session.commit()
    log_audit(user, 'JOB_UPDATED', f"Updated Job #{job.job_number}")
    return jsonify({'message': 'Job updated successfully', 'job': job.to_dict()})


@jobs_bp.route('/<string:job_identifier>', methods=['DELETE'])
@token_required
def delete_job(job_identifier):
    user = request.current_user
    if user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Permission denied. Only Admin or Manager can delete jobs.'}), 403

    try:
        int_id = int(job_identifier)
    except (ValueError, TypeError):
        int_id = -1
    job = Job.query.filter((Job.job_number == str(job_identifier)) | (Job.id == int_id)).first()
    if not job:
        return jsonify({'message': 'Job not found'}), 404

    job_num = job.job_number
    db.session.delete(job)
    db.session.commit()
    log_audit(user, 'JOB_DELETED', f"Deleted Job #{job_num}")
    return jsonify({'message': f'Job #{job_num} deleted successfully'})


# Production Sheets Endpoints
@jobs_bp.route('/production-sheets', methods=['GET'])
def get_production_sheets():
    sheets = ProductionSheetEntry.query.order_by(ProductionSheetEntry.created_at.desc()).all()
    return jsonify({'productionSheets': [s.to_dict() for s in sheets]})


@jobs_bp.route('/production-sheets', methods=['POST'])
@token_required
def create_production_sheet():
    user = request.current_user
    data = request.get_json() or {}
    sheet = ProductionSheetEntry(
        date=data.get('date') or datetime.utcnow().strftime('%Y-%m-%d'),
        editor_name=data.get('editorName') or user.name or 'Employee',
        role=data.get('role') or 'Editor',
        job_id=str(data.get('jobId') or ''),
        client=data.get('client') or 'BE',
        stage=data.get('stage') or 'Editor',
        files_processed=int(data.get('filesProcessed') or 0),
        active_minutes=int(data.get('activeMinutes') or 0),
        pause_minutes=int(data.get('pauseMinutes') or 0),
        status=data.get('status') or 'Verified'
    )
    db.session.add(sheet)
    db.session.commit()
    return jsonify({'message': 'Production sheet created', 'sheet': sheet.to_dict()}), 201


@jobs_bp.route('/audit-logs', methods=['GET'])
@token_required
def get_audit_logs():
    user = request.current_user
    if user.role != 'admin':
        return jsonify({'message': 'Permission denied'}), 403
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify({'auditLogs': [l.to_dict() for l in logs]})
