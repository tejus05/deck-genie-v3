"""make_file_path_nullable

Revision ID: f2acd122a7a5
Revises: 6c13736bc49d
Create Date: 2025-07-02 18:43:58.241906

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2acd122a7a5'
down_revision = '6c13736bc49d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make file_path nullable for UploadThing presentations
    op.alter_column('presentation', 'file_path', nullable=True)


def downgrade() -> None:
    # Make file_path required again (but this might fail if there are UploadThing records)
    op.alter_column('presentation', 'file_path', nullable=False)
