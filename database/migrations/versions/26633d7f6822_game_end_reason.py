"""add games.end_reason

Needed for the shareable win-card feature — the card shows *how* a
game ended (checkmate / resignation / timeout), which wasn't being
persisted anywhere before (only the WHITE/BLACK/DRAW result was).

Revision ID: 26633d7f6822
Revises: 69a15835ceb5
Create Date: 2026-08-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '26633d7f6822'
down_revision: Union[str, Sequence[str], None] = '69a15835ceb5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'games',
        sa.Column('end_reason', sa.String(length=32), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column('games', 'end_reason')
