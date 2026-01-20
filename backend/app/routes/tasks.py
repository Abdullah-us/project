from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.task import Task
from ..models.project import Project
from ..models.user import User
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    """Get all tasks for current user"""
    user_id = get_jwt_identity()
    
    # Get tasks where user is assigned or from user's projects
    assigned_tasks = Task.query.filter_by(assignee_id=user_id).all()
    
    # Get user's projects
    user = User.query.get(user_id)
    user_projects = user.projects + Project.query.filter_by(owner_id=user_id).all()
    project_ids = [project.id for project in user_projects]
    
    # Get tasks from user's projects
    project_tasks = Task.query.filter(Task.project_id.in_(project_ids)).all()
    
    # Combine and remove duplicates
    all_tasks = list(set(assigned_tasks + project_tasks))
    
    return jsonify({
        'tasks': [task.to_dict() for task in all_tasks]
    }), 200

@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    """Create a new task"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('title') or not data.get('project_id'):
        return jsonify({'error': 'Title and project ID are required'}), 400
    
    # Check if project exists and user has access
    project = Project.query.get(data['project_id'])
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    if project.owner_id != user_id and user_id not in [member.id for member in project.members]:
        return jsonify({'error': 'Access denied'}), 403
    
    # Create task
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        status=data.get('status', 'not-started'),
        priority=data.get('priority', 'medium'),
        project_id=data['project_id'],
        assignee_id=data.get('assignee_id')
    )
    
    if data.get('due_date'):
        task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')).date()
    if data.get('estimated_hours'):
        task.estimated_hours = float(data['estimated_hours'])
    
    # Set position (add to end of list)
    max_position = db.session.query(db.func.max(Task.position)).filter_by(
        project_id=data['project_id'],
        status=data.get('status', 'not-started')
    ).scalar() or 0
    task.position = max_position + 1
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        'message': 'Task created successfully',
        'task': task.to_dict()
    }), 201

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """Get task by ID"""
    user_id = get_jwt_identity()
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Check if user has access to the project
    project = Project.query.get(task.project_id)
    if project.owner_id != user_id and user_id not in [member.id for member in project.members]:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({'task': task.to_dict()}), 200

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Update task"""
    user_id = get_jwt_identity()
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Check if user has access to the project
    project = Project.query.get(task.project_id)
    if project.owner_id != user_id and user_id not in [member.id for member in project.members]:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'status' in data:
        # If status changed, update position
        if task.status != data['status']:
            # Get max position in new status
            max_position = db.session.query(db.func.max(Task.position)).filter_by(
                project_id=task.project_id,
                status=data['status']
            ).scalar() or 0
            task.position = max_position + 1
        task.status = data['status']
    if 'priority' in data:
        task.priority = data['priority']
    if 'assignee_id' in data:
        task.assignee_id = data['assignee_id']
    if 'due_date' in data:
        if data['due_date']:
            task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')).date()
        else:
            task.due_date = None
    if 'estimated_hours' in data:
        task.estimated_hours = float(data['estimated_hours']) if data['estimated_hours'] else None
    if 'actual_hours' in data:
        task.actual_hours = float(data['actual_hours']) if data['actual_hours'] else 0
    
    db.session.commit()
    
    return jsonify({
        'message': 'Task updated successfully',
        'task': task.to_dict()
    }), 200

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """Delete task"""
    user_id = get_jwt_identity()
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Check if user has access to the project
    project = Project.query.get(task.project_id)
    if project.owner_id != user_id and user_id not in [member.id for member in project.members]:
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted successfully'}), 200

@tasks_bp.route('/project/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project_tasks(project_id):
    """Get all tasks for a project"""
    user_id = get_jwt_identity()
    
    # Check if project exists and user has access
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    if project.owner_id != user_id and user_id not in [member.id for member in project.members]:
        return jsonify({'error': 'Access denied'}), 403
    
    tasks = Task.query.filter_by(project_id=project_id).order_by(Task.position).all()
    
    return jsonify({
        'tasks': [task.to_dict() for task in tasks]
    }), 200

@tasks_bp.route('/reorder', methods=['POST'])
@jwt_required()
def reorder_tasks():
    """Reorder tasks within a status column"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    task_id = data.get('task_id')
    new_position = data.get('position')
    new_status = data.get('status')
    
    if not task_id or new_position is None:
        return jsonify({'error': 'Task ID and position are required'}), 400
    
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Check if user has access to the project
    project = Project.query.get(task.project_id)
    if project.owner_id != user_id and user_id not in [member.id for member in project.members]:
        return jsonify({'error': 'Access denied'}), 403
    
    old_status = task.status
    old_position = task.position
    
    # If status changed
    if new_status and new_status != old_status:
        task.status = new_status
        
        # Shift tasks in old status up
        Task.query.filter(
            Task.project_id == task.project_id,
            Task.status == old_status,
            Task.position > old_position
        ).update({Task.position: Task.position - 1})
        
        # Shift tasks in new status down
        Task.query.filter(
            Task.project_id == task.project_id,
            Task.status == new_status,
            Task.position >= new_position
        ).update({Task.position: Task.position + 1})
    
    # If position changed within same status
    elif new_position != old_position:
        if new_position > old_position:
            # Moving down
            Task.query.filter(
                Task.project_id == task.project_id,
                Task.status == old_status,
                Task.position > old_position,
                Task.position <= new_position
            ).update({Task.position: Task.position - 1})
        else:
            # Moving up
            Task.query.filter(
                Task.project_id == task.project_id,
                Task.status == old_status,
                Task.position >= new_position,
                Task.position < old_position
            ).update({Task.position: Task.position + 1})
    
    task.position = new_position
    db.session.commit()
    
    return jsonify({
        'message': 'Task reordered successfully',
        'task': task.to_dict()
    }), 200