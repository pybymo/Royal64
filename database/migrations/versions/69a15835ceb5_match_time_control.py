"""add matches.time_control_minutes

The offer's chosen time control (MatchOffer.time_control) was being
read at offer-creation time but never carried onto the Match — so by
the time a Game needed it, it was gone. Games.time_control_minutes
also has no default, so game creation was failing outright before
this. Found while wiring up Bo3 auto-progression.

Revision ID: 69a15835ceb5
Revises: 8f62a0ce859e
Create Date: 2026-07-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '69a15835ceb5'
down_revision: Union[str, Sequence[str], None] = '8f62a0ce859e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'matches',
        sa.Column(
            'time_control_minutes',
            sa.Integer(),
            nullable=False,
            server_default='5',
        ),
    )

    # server_default was only needed so the ALTER succeeds against
    # existing rows; new inserts should always supply it explicitly.
    op.alter_column('matches', 'time_control_minutes', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column('matches', 'time_control_minutes')
