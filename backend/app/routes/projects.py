from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.project import Project
from ..models.user import User
from datetime import datetime

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('', methods=['GET'])
@jwt_required()
def get_projects():
    """Get all projects for current user"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Get projects where user is owner or member
    owned_projects = Project.query.filter_by(owner_id=user_id).all()
    member_projects = user.projects
    
    # Combine and remove duplicates
    all_projects = list(set(owned_projects + member_projects))
    
    return jsonify({
        'projects': [project.to_dict() for project in all_projects]
    }), 200

@projects_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new project"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Project name is required'}), 400
    
    # Create project
    project = Project(
        name=data['name'],
        description=data.get('description', ''),
        status=data.get('status', 'planning'),
        priority=data.get('priority', 'medium'),
        progress=data.get('progress', 0),
        owner_id=user_id
    )
    
    if data.get('start_date'):
        project.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00')).date()
    if data.get('due_date'):
        project.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')).date()
    
    # Add current user as member
    user = User.query.get(user_id)
    project.members.append(user)
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify({
        'message': 'Project created successfully',
        'project': project.to_dict_with_details()
    }), 201

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """Get project by ID"""
    user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Check if user has access
    if project.owner_id != user_id and user_id not in [member.id for member in project.members]:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({
        'project': project.to_dict_with_details()
    }), 200

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Update project"""
    user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Check if user is owner
    if project.owner_id != user_id:
        return jsonify({'error': 'Only project owner can update'}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'name' in data:
        project.name = data['name']
    if 'description' in data:
        project.description = data['description']
    if 'status' in data:
        project.status = data['status']
    if 'priority' in data:
        project.priority = data['priority']
    if 'progress' in data:
        project.progress = data['progress']
    if 'start_date' in data and data['start_date']:
        project.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00')).date()
    if 'due_date' in data and data['due_date']:
        project.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')).date()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Project updated successfully',
        'project': project.to_dict()
    }), 200

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Delete project"""
    user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Check if user is owner
    if project.owner_id != user_id:
        return jsonify({'error': 'Only project owner can delete'}), 403
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': 'Project deleted successfully'}), 200

@projects_bp.route('/<int:project_id>/members', methods=['GET'])
@jwt_required()
def get_project_members(project_id):
    """Get project members"""
    user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Check if user has access
    if project.owner_id != user_id and user_id not in [member.id for member in project.members]:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({
        'members': [member.to_dict() for member in project.members]
    }), 200

@projects_bp.route('/<int:project_id>/members', methods=['POST'])
@jwt_required()
def add_project_member(project_id):
    """Add member to project"""
    user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Check if user is owner
    if project.owner_id != user_id:
        return jsonify({'error': 'Only project owner can add members'}), 403
    
    data = request.get_json()
    member_id = data.get('user_id')
    
    if not member_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Find user
    user = User.query.get(member_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if already a member
    if user in project.members:
        return jsonify({'error': 'User is already a project member'}), 400
    
    # Add user to project
    project.members.append(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Member added successfully',
        'member': user.to_dict()
    }), 200

@projects_bp.route('/<int:project_id>/members/<int:member_id>', methods=['DELETE'])
@jwt_required()
def remove_project_member(project_id, member_id):
    """Remove member from project"""
    user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Check if user is owner
    if project.owner_id != user_id:
        return jsonify({'error': 'Only project owner can remove members'}), 403
    
    # Find user
    user = User.query.get(member_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user is a member
    if user not in project.members:
        return jsonify({'error': 'User is not a project member'}), 400
    
    # Cannot remove owner
    if member_id == project.owner_id:
        return jsonify({'error': 'Cannot remove project owner'}), 400
    
    # Remove user from project
    project.members.remove(user)
    db.session.commit()
    
    return jsonify({'message': 'Member removed successfully'}), 200