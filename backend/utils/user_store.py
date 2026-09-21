import os
import json

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
STORE_FILE = os.path.join(DATA_DIR, 'users_store.json')


def ensure_data_dir():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        if not os.path.exists(STORE_FILE):
            with open(STORE_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f, indent=2)
    except Exception as e:
        print("Error initializing user store directory:", e)


def load_stored_users():
    ensure_data_dir()
    try:
        if os.path.exists(STORE_FILE):
            with open(STORE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
    except Exception as e:
        print("Error reading stored users:", e)
    return []


def save_user_to_store(user_obj, raw_password=None):
    """
    Saves or updates a user in the persistent users_store.json file.
    """
    ensure_data_dir()
    try:
        users = load_stored_users()
        email_lower = user_obj.email.lower().strip()

        # Find existing
        idx = next((i for i, u in enumerate(users) if u.get('email', '').lower().strip() == email_lower), -1)

        user_entry = {
            'email': user_obj.email,
            'name': user_obj.name,
            'role': user_obj.role,
            'designation': user_obj.designation,
            'is_approved': getattr(user_obj, 'is_approved', True),
            'permissions': user_obj.permissions if hasattr(user_obj, 'permissions') else {},
            'password_hash': user_obj.password_hash,
        }
        if raw_password:
            user_entry['raw_password'] = raw_password

        if idx >= 0:
            users[idx] = user_entry
        else:
            users.append(user_entry)

        with open(STORE_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2)
    except Exception as e:
        print("Error saving user to store:", e)


def remove_user_from_store(email):
    ensure_data_dir()
    try:
        users = load_stored_users()
        email_lower = (email or '').lower().strip()
        filtered = [u for u in users if u.get('email', '').lower().strip() != email_lower]
        with open(STORE_FILE, 'w', encoding='utf-8') as f:
            json.dump(filtered, f, indent=2)
    except Exception as e:
        print("Error removing user from store:", e)
