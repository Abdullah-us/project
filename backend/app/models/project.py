from .. import db
from datetime import datetime

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default='planning')
    priority = db.Column(db.String(20), default='medium')
    progress = db.Column(db.Integer, default=0)
    start_date = db.Column(db.Date)
    due_date = db.Column(db.Date) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    owner = db.relationship('User', foreign_keys=[owner_id])
    members = db.relationship('User', secondary='project_members', back_populates='projects')
    tasks = db.relationship('Task', back_populates='project', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'progress': self.progress,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'owner_id': self.owner_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'team': len(self.members),
            'tasks_count': len(self.tasks)
        }
    
    def to_dict_with_details(self):
        """Convert to dictionary with details"""
        data = self.to_dict()
        data['members'] = [member.to_dict() for member in self.members]
        data['tasks'] = [task.to_dict() for task in self.tasks]
        return data