import unittest
import json
from app import create_app, db
from models import User, Job, JobStage
from config import Config


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


class BackendTestSuite(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def get_admin_token(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'arun@aszen.com',
            'password': 'Aszen@123'
        })
        return res.get_json()['token']

    def test_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), {'status': 'ok'})

    def test_login_success(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'arun@aszen.com',
            'password': 'Aszen@123'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('token', data)
        self.assertEqual(data['user']['email'], 'arun@aszen.com')

    def test_login_invalid_password(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'arun@aszen.com',
            'password': 'WrongPassword'
        })
        self.assertEqual(res.status_code, 401)

    def test_legacy_test_accounts_absent(self):
        shwetha = User.query.filter_by(email='shwetha@aszen.com').first()
        qa_tester = User.query.filter_by(email='qa_perm_test@aszen.com').first()
        self.assertIsNone(shwetha)
        self.assertIsNone(qa_tester)

    def test_job_creation_and_granular_stage_patch(self):
        token = self.get_admin_token()
        headers = {'Authorization': f'Bearer {token}'}

        # 1. Create Job
        create_res = self.client.post('/api/jobs', headers=headers, json={
            'jobNumber': '2001',
            'client': 'BE',
            'service': 'Real Estate Photo Shoot',
            'outputTarget': 50,
            'stages': {
                'blending': {'assignee': 'John Editor', 'status': 'Pending'},
                'path1': {'assignee': 'Sarah Path', 'status': 'Pending'}
            }
        })
        self.assertEqual(create_res.status_code, 201)
        created_job = create_res.get_json()['job']
        self.assertEqual(created_job['jobNumber'], '2001')

        # 2. Granular PATCH stage without overwriting other stages
        patch_res = self.client.patch('/api/jobs/2001/stages/blending', headers=headers, json={
            'status': 'In-Progress',
            'startTime': '2026-09-28T10:00:00.000Z',
            'filesCount': 50
        })
        self.assertEqual(patch_res.status_code, 200)
        patched_stage = patch_res.get_json()['stage']
        self.assertEqual(patched_stage['status'], 'In-Progress')
        self.assertEqual(patched_stage['startTime'], '2026-09-28T10:00:00.000Z')

        # Verify other stage was NOT mutated
        path1_stage = JobStage.query.filter_by(job_id=created_job['db_id'], stage_key='path1').first()
        self.assertEqual(path1_stage.status, 'Pending')
        self.assertEqual(path1_stage.assignee, 'Sarah Path')

    def test_leave_request_flow(self):
        admin_token = self.get_admin_token()
        admin_headers = {'Authorization': f'Bearer {admin_token}'}

        # 1. Admin CANNOT apply for leave (403 forbidden)
        admin_apply_res = self.client.post('/api/leaves', headers=admin_headers, json={
            'leaveType': 'Leave',
            'startDate': '2026-10-05',
            'endDate': '2026-10-06',
            'days': 2,
            'reason': 'Admin personal leave'
        })
        self.assertEqual(admin_apply_res.status_code, 403)

        # 2. Employee applies for leave
        self.client.post('/api/auth/register', json={
            'name': 'Employee Tester',
            'email': 'emptester@aszen.com',
            'password': 'Password@123',
            'designation': 'Editor'
        })
        login_res = self.client.post('/api/auth/login', json={
            'email': 'emptester@aszen.com',
            'password': 'Password@123'
        })
        emp_token = login_res.get_json()['token']
        emp_headers = {'Authorization': f'Bearer {emp_token}'}

        res = self.client.post('/api/leaves', headers=emp_headers, json={
            'leaveType': 'Leave',
            'startDate': '2026-10-05',
            'endDate': '2026-10-06',
            'days': 2,
            'isHalfDay': False,
            'reason': 'Family function',
            'backupEmployee': 'Dhanush',
            'emergencyContact': '+91 9988776655'
        })
        self.assertEqual(res.status_code, 201)
        leave = res.get_json()['leaveRequest']
        self.assertEqual(leave['status'], 'Pending')
        self.assertEqual(leave['days'], 2)
        leave_id = leave['id']

        # 3. List leaves
        res_list = self.client.get('/api/leaves', headers=admin_headers)
        self.assertEqual(res_list.status_code, 200)
        leaves_data = res_list.get_json()['leaveRequests']
        self.assertTrue(any(l['id'] == leave_id for l in leaves_data))

        # 4. Admin approves leave
        patch_res = self.client.patch(f'/api/leaves/{leave_id}/status', headers=admin_headers, json={
            'status': 'Approved',
            'managerNotes': 'Approved, have a great time.'
        })
        self.assertEqual(patch_res.status_code, 200)
        updated_leave = patch_res.get_json()['leaveRequest']
        self.assertEqual(updated_leave['status'], 'Approved')
        self.assertEqual(updated_leave['managerNotes'], 'Approved, have a great time.')

        # 5. Case-insensitive balance check
        bal_res = self.client.get('/api/leaves/balances/EMPTESTER@ASZEN.COM', headers=emp_headers)
        self.assertEqual(bal_res.status_code, 200)
        bal_data = bal_res.get_json()['balances']
        self.assertEqual(bal_data['used'], 2.0)
        self.assertEqual(bal_data['available'], 16.0)

        # 6. Date validation: End date earlier than start date returns 400
        invalid_res = self.client.post('/api/leaves', headers=emp_headers, json={
            'startDate': '2026-10-20',
            'endDate': '2026-10-15',
            'reason': 'Bad dates'
        })
        self.assertEqual(invalid_res.status_code, 400)
        self.assertIn('earlier', invalid_res.get_json()['message'])

    def test_developer_role_and_permissions(self):
        admin_token = self.get_admin_token()
        admin_headers = {'Authorization': f'Bearer {admin_token}'}

        # 1. Register a user with Developer designation
        reg_res = self.client.post('/api/auth/register', json={
            'name': 'Dev Tester',
            'email': 'devtester@aszen.com',
            'password': 'Password@123',
            'designation': 'Developer'
        })
        self.assertEqual(reg_res.status_code, 201)
        dev_user = reg_res.get_json()['user']
        self.assertEqual(dev_user['role'], 'developer')
        self.assertEqual(dev_user['designation'], 'Developer')

        # Check default permissions for developer: no task interference permissions
        dev_perms = dev_user.get('permissions', {})
        self.assertFalse(dev_perms.get('can_create_job', False))
        self.assertFalse(dev_perms.get('can_edit_job', False))
        self.assertFalse(dev_perms.get('can_delete_job', False))

        # 2. Login as developer succeeds with shift login tracking
        login_res = self.client.post('/api/auth/login', json={
            'email': 'devtester@aszen.com',
            'password': 'Password@123'
        })
        self.assertEqual(login_res.status_code, 200)
        dev_token = login_res.get_json()['token']
        dev_headers = {'Authorization': f'Bearer {dev_token}'}

        # 3. Developer can apply for leave
        leave_res = self.client.post('/api/leaves', headers=dev_headers, json={
            'leaveType': 'Leave',
            'startDate': '2026-10-12',
            'endDate': '2026-10-13',
            'days': 2,
            'isHalfDay': False,
            'reason': 'Developer Annual Leave'
        })
        self.assertEqual(leave_res.status_code, 201)

        # 4. Developer CANNOT interfere with production tasks: job creation is FORBIDDEN (403)
        job_res = self.client.post('/api/jobs', headers=dev_headers, json={
            'jobNumber': 'DEV-999',
            'client': 'BE',
            'service': 'Developer Pipeline Test',
            'outputTarget': 25,
            'stages': {
                'blending': {'assignee': 'Dev Tester', 'status': 'Pending'}
            }
        })
        self.assertEqual(job_res.status_code, 403)

    def test_client_code_only_registration(self):
        admin_token = self.get_admin_token()
        headers = {'Authorization': f'Bearer {admin_token}'}

        # Create client with ONLY code (no mandate of name or email)
        res = self.client.post('/api/clients', headers=headers, json={
            'code': 'lux'
        })
        self.assertEqual(res.status_code, 201)
        client = res.get_json()['client']
        self.assertEqual(client['code'], 'LUX')
        self.assertEqual(client['name'], 'LUX')

    def test_production_sheet_creation_and_import(self):
        admin_token = self.get_admin_token()
        headers = {'Authorization': f'Bearer {admin_token}'}

        # 1. Create single production sheet entry
        create_res = self.client.post('/api/jobs/production-sheets', headers=headers, json={
            'date': '2026-10-06',
            'inputDate': '2026-10-06',
            'propertyName': '123 Ocean View Drive',
            'service': 'Dusk Retouch',
            'numberOfImages': 42,
            'comments': 'Fast delivery requested',
            'client': 'BE',
            'editorName': 'Staff Editor',
            'activeMinutes': 35
        })
        self.assertEqual(create_res.status_code, 201)
        sheet = create_res.get_json().get('sheet') or create_res.get_json().get('entry')
        self.assertEqual(sheet['propertyName'], '123 Ocean View Drive')
        self.assertEqual(sheet['service'], 'Dusk Retouch')
        self.assertEqual(sheet['numberOfImages'], 42)
        self.assertEqual(sheet['comments'], 'Fast delivery requested')
        self.assertEqual(sheet['client'], 'BE')

        # 2. Batch import production sheets
        import_res = self.client.post('/api/jobs/production-sheets/import', headers=headers, json={
            'sheets': [
                {
                    'inputDate': '2026-09-15',
                    'propertyName': '456 Hilltop Terrace Unit #12',
                    'service': 'RE Editing',
                    'numberOfImages': 55,
                    'comments': 'Special exposure fix',
                    'client': 'PR',
                    'editorName': 'Alex'
                },
                {
                    'inputDate': '2026-09-16',
                    'propertyName': '789 Sunset Blvd',
                    'service': 'Virtual Staging',
                    'numberOfImages': 18,
                    'comments': '',
                    'client': 'CE',
                    'editorName': 'Sam'
                }
            ]
        })
        self.assertEqual(import_res.status_code, 201)
        import_data = import_res.get_json()
        self.assertEqual(import_data['count'], 2)

        # 3. Fetch all production sheets and verify fields
        get_res = self.client.get('/api/jobs/production-sheets', headers=headers)
        self.assertEqual(get_res.status_code, 200)
        all_sheets = get_res.get_json()['productionSheets']
        self.assertGreaterEqual(len(all_sheets), 3)

        # Find the imported row with # in address to verify special character resilience
        hilltop = next((s for s in all_sheets if '456 Hilltop' in (s.get('propertyName') or '')), None)
        self.assertIsNotNone(hilltop)
        self.assertEqual(hilltop['client'], 'PR')
        self.assertEqual(hilltop['numberOfImages'], 55)
        self.assertEqual(hilltop['comments'], 'Special exposure fix')

    def test_work_session_tracking_and_stats(self):
        admin_token = self.get_admin_token()
        headers = {'Authorization': f'Bearer {admin_token}'}

        # 1. Create a manual work session
        ws_res = self.client.post('/api/work-hours/manual', headers=headers, json={
            'user_name': 'Test Staff',
            'user_email': 'teststaff@aszen.com',
            'date': '2026-10-06',
            'login_time': '2026-10-06T09:00:00.000Z',
            'logout_time': '2026-10-06T17:30:00.000Z',
            'notes': 'Full shift completed'
        })
        self.assertEqual(ws_res.status_code, 201)
        ws_id = ws_res.get_json()['session']['id']

        # 2. Get work sessions
        list_res = self.client.get('/api/work-hours/all', headers=headers)
        self.assertEqual(list_res.status_code, 200)
        sessions = list_res.get_json()['sessions']
        self.assertTrue(any(s['id'] == ws_id for s in sessions))



if __name__ == '__main__':
    unittest.main()


