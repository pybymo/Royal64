"""add users.is_bot

Marks the system bot opponent user so game logic can tell a bot
player apart from a real one (auto-move after the human plays, skip
wallet/payout requirements, etc).

Revision ID: 2fcf4aec072c
Revises: 117682cbebf6
Create Date: 2026-08-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '2fcf4aec072c'
down_revision: Union[str, Sequence[str], None] = '117682cbebf6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'users',
        sa.Column('is_bot', sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    op.alter_column('users', 'is_bot', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column('users', 'is_bot')
