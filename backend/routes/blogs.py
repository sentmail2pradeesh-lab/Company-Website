from flask import Blueprint, request, jsonify
from database import db
from models import Blog
from utils.jwt import token_required

blogs_bp = Blueprint('blogs', __name__)


@blogs_bp.route('', methods=['GET'])
def get_blogs():
    blogs = Blog.query.order_by(Blog.created_at.desc()).all()
    return jsonify({'blogs': [b.to_dict() for b in blogs]})


@blogs_bp.route('/<int:blog_id>', methods=['GET'])
def get_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    return jsonify({'blog': blog.to_dict()})


@blogs_bp.route('', methods=['POST'])
@token_required
def create_blog():
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    excerpt = (data.get('excerpt') or '').strip()

    if not title or not excerpt:
        return jsonify({'message': 'Title and excerpt are required'}), 400

    blog = Blog(
        title=title,
        excerpt=excerpt,
        content=data.get('content'),
        image_url=data.get('image_url'),
    )
    db.session.add(blog)
    db.session.commit()

    return jsonify({'message': 'Blog created', 'blog': blog.to_dict()}), 201
