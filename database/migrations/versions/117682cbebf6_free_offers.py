"""match_offers.wallet_id nullable (free games)

Free games (stake=0) don't need a wallet at all — no money moves, so
there's nothing to require a payout destination for. wallet_id was
NOT NULL, which made it impossible to ever create a free offer.

Revision ID: 117682cbebf6
Revises: 0e05d92db7c5
Create Date: 2026-08-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '117682cbebf6'
down_revision: Union[str, Sequence[str], None] = '0e05d92db7c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.alter_column(
        'match_offers',
        'wallet_id',
        existing_type=sa.UUID(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.alter_column(
        'match_offers',
        'wallet_id',
        existing_type=sa.UUID(),
        nullable=False,
    )
