from flask import Blueprint, request, jsonify
from database import db
from models import Client
from utils.jwt import token_required

clients_bp = Blueprint('clients', __name__)


@clients_bp.route('', methods=['GET'])
def get_clients():
    clients = Client.query.order_by(Client.created_at.asc()).all()
    return jsonify({'clients': [c.to_dict() for c in clients]})


@clients_bp.route('', methods=['POST'])
@token_required
def create_client():
    current = request.current_user
    if current.role != 'admin':
        return jsonify({'message': 'Permission denied. Only Admin can create clients.'}), 403

    data = request.get_json() or {}
    code = (data.get('code') or '').strip().upper()
    name = (data.get('name') or '').strip()
    contact = (data.get('contact') or '').strip()

    if not code or not name:
        return jsonify({'message': 'Client Code and Name are required.'}), 400

    existing = Client.query.filter(Client.code == code).first()
    if existing:
        return jsonify({'message': f'Client with code "{code}" already exists.'}), 409

    new_client = Client(code=code, name=name, contact=contact)
    db.session.add(new_client)
    db.session.commit()

    return jsonify({'message': 'Client created successfully', 'client': new_client.to_dict()}), 201


@clients_bp.route('/<int:client_id>', methods=['DELETE'])
@token_required
def delete_client(client_id):
    current = request.current_user
    if current.role != 'admin':
        return jsonify({'message': 'Permission denied. Only Admin can delete clients.'}), 403

    client = Client.query.get(client_id)
    if not client:
        return jsonify({'message': 'Client not found'}), 404

    db.session.delete(client)
    db.session.commit()

    return jsonify({'message': 'Client deleted successfully'})
