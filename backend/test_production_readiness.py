import unittest
import json
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from database import db
from models import User, WorkSession

class TestDynamicDesignations(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.drop_all()
            db.create_all()
            # Seed master Admin
            admin = User(email='arun@aszen.com', name='Arun', role='admin', designation='Admin / System Manager')
            admin.set_password('Aszen@123')
            db.session.add(admin)
            db.session.commit()

            # Obtain Admin Token
            res = self.client.post('/api/auth/login', json={'email': 'arun@aszen.com', 'password': 'Aszen@123'})
            data = json.loads(res.data.decode('utf-8'))
            self.admin_token = data['token']



    def test_01_only_admin_seeded(self):
        with self.app.app_context():
            user_count = User.query.count()
            self.assertEqual(user_count, 1)
            admin = User.query.first()
            self.assertEqual(admin.email, 'arun@aszen.com')

    def test_02_admin_creates_manager_by_designation(self):
        res = self.client.post(
            '/api/auth/users',
            json={
                'name': 'Lessy Manager',
                'email': 'lessy@aszen.com',
                'designation': 'Manager',
                'password': 'Aszen@123'
            },
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data.decode('utf-8'))
        self.assertEqual(data['user']['role'], 'manager')
        self.assertEqual(data['user']['designation'], 'Manager')

    def test_03_admin_creates_senior_editor_by_designation(self):
        res = self.client.post(
            '/api/auth/users',
            json={
                'name': 'Lalithaa Senior Editor',
                'email': 'lalithaa@aszen.com',
                'designation': 'Senior Editor',
                'password': 'Aszen@123'
            },
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data.decode('utf-8'))
        self.assertEqual(data['user']['role'], 'employee')
        self.assertEqual(data['user']['designation'], 'Senior Editor')

    def test_04_generic_login_returns_designation(self):
        # Create Senior Editor
        self.client.post(
            '/api/auth/users',
            json={'name': 'Lalithaa', 'email': 'lalithaa@aszen.com', 'designation': 'Senior Editor', 'password': 'Aszen@123'},
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        # Login generically
        res = self.client.post('/api/auth/login', json={'email': 'lalithaa@aszen.com', 'password': 'Aszen@123'})
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data.decode('utf-8'))
        self.assertEqual(data['user']['designation'], 'Senior Editor')

    def test_05_senior_editor_forbidden_from_managing_team_work_hours(self):
        # Create Senior Editor
        self.client.post(
            '/api/auth/users',
            json={'name': 'Lalithaa', 'email': 'lalithaa@aszen.com', 'designation': 'Senior Editor', 'password': 'Aszen@123'},
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        login_res = self.client.post('/api/auth/login', json={'email': 'lalithaa@aszen.com', 'password': 'Aszen@123'})
        se_token = json.loads(login_res.data.decode('utf-8'))['token']

        # Attempt to access team work hours sheet
        res = self.client.get('/api/work-hours/all', headers={'Authorization': f'Bearer {se_token}'})
        self.assertEqual(res.status_code, 403)

    def test_06_manager_allowed_access_to_team_work_hours(self):
        # Create Manager
        self.client.post(
            '/api/auth/users',
            json={'name': 'Lessy', 'email': 'lessy@aszen.com', 'designation': 'Manager', 'password': 'Aszen@123'},
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        login_res = self.client.post('/api/auth/login', json={'email': 'lessy@aszen.com', 'password': 'Aszen@123'})
        mgr_token = json.loads(login_res.data.decode('utf-8'))['token']

        # Access team work hours sheet
        res = self.client.get('/api/work-hours/all', headers={'Authorization': f'Bearer {mgr_token}'})
        self.assertEqual(res.status_code, 200)

if __name__ == '__main__':
    unittest.main()
