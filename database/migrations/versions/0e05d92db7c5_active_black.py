"""add games.active_black

active_white already existed but its black counterpart never did —
needed to track connection state symmetrically for the 60s-reconnect
/ 3-strikes disconnect rules.

Revision ID: 0e05d92db7c5
Revises: 26633d7f6822
Create Date: 2026-08-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0e05d92db7c5'
down_revision: Union[str, Sequence[str], None] = '26633d7f6822'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'games',
        sa.Column('active_black', sa.Boolean(), nullable=False, server_default=sa.true()),
    )

    op.alter_column('games', 'active_black', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column('games', 'active_black')
