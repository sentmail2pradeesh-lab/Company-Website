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
        token = self.get_admin_token()
        headers = {'Authorization': f'Bearer {token}'}

        # 1. Apply for leave
        res = self.client.post('/api/leaves', headers=headers, json={
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

        # 2. List leaves
        res_list = self.client.get('/api/leaves', headers=headers)
        self.assertEqual(res_list.status_code, 200)
        leaves_data = res_list.get_json()['leaveRequests']
        self.assertTrue(any(l['id'] == leave_id for l in leaves_data))

        # 3. Approve leave
        patch_res = self.client.patch(f'/api/leaves/{leave_id}/status', headers=headers, json={
            'status': 'Approved',
            'managerNotes': 'Approved, have a great time.'
        })
        self.assertEqual(patch_res.status_code, 200)
        updated_leave = patch_res.get_json()['leaveRequest']
        self.assertEqual(updated_leave['status'], 'Approved')
        self.assertEqual(updated_leave['managerNotes'], 'Approved, have a great time.')

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


if __name__ == '__main__':
    unittest.main()

