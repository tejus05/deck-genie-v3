"""Add UploadThing fields to Presentation model

Revision ID: 6c13736bc49d
Revises: 
Create Date: 2025-07-02 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6c13736bc49d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add UploadThing fields to presentation table if it exists
    try:
        # Add new UploadThing columns to presentation table
        op.add_column('presentation', sa.Column('uploadthing_url', sa.String(), nullable=True))
        op.add_column('presentation', sa.Column('uploadthing_key', sa.String(), nullable=True))
        op.add_column('presentation', sa.Column('uploadthing_thumbnail_url', sa.String(), nullable=True))
        op.add_column('presentation', sa.Column('uploadthing_thumbnail_key', sa.String(), nullable=True))
        op.add_column('presentation', sa.Column('file_size', sa.Integer(), nullable=True))
        
        # Make existing file_path nullable for backward compatibility
        op.alter_column('presentation', 'file_path', nullable=True)
        
    except Exception as e:
        # If presentation table doesn't exist, create it
        op.create_table('presentation',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('owner_id', sa.Integer(), nullable=False),
            sa.Column('file_path', sa.String(), nullable=True),
            sa.Column('thumbnail_path', sa.String(), nullable=True),
            sa.Column('uploadthing_url', sa.String(), nullable=True),
            sa.Column('uploadthing_key', sa.String(), nullable=True),
            sa.Column('uploadthing_thumbnail_url', sa.String(), nullable=True),
            sa.Column('uploadthing_thumbnail_key', sa.String(), nullable=True),
            sa.Column('file_size', sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ),
            sa.PrimaryKeyConstraint('id')
        )


def downgrade() -> None:
    # Remove UploadThing fields from presentation table
    try:
        op.drop_column('presentation', 'file_size')
        op.drop_column('presentation', 'uploadthing_thumbnail_key')
        op.drop_column('presentation', 'uploadthing_thumbnail_url')
        op.drop_column('presentation', 'uploadthing_key')
        op.drop_column('presentation', 'uploadthing_url')
        
        # Make file_path non-nullable again
        op.alter_column('presentation', 'file_path', nullable=False)
        
    except Exception:
        # If we created the table in upgrade, drop it completely
        op.drop_table('presentation')
