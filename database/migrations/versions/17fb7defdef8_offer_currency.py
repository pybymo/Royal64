"""add match_offers.currency

First step toward supporting USDT (a TON jetton) stakes alongside
native TON — see contracts/escrow_usdt/ and docs/USDT_STAKES.md.

Revision ID: 17fb7defdef8
Revises: 2fcf4aec072c
Create Date: 2026-08-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '17fb7defdef8'
down_revision: Union[str, Sequence[str], None] = '2fcf4aec072c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'match_offers',
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='TON'),
    )

    op.alter_column('match_offers', 'currency', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column('match_offers', 'currency')
