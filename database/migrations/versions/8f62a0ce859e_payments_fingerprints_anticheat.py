"""payments, fingerprints, anti_cheat_logs; moves.player_id nullable

None of this was ever migrated even though the models existed in code
— Payment/Fingerprint/AntiCheatLog were added this pass with no
migration at all, and moves.player_id was created NOT NULL back when
first_position() didn't exist yet (it inserts a synthetic starting
position row with no player). Without this, every one of those
features fails at the database, not just in Python.

Revision ID: 8f62a0ce859e
Revises: df4050485133
Create Date: 2026-07-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '8f62a0ce859e'
down_revision: Union[str, Sequence[str], None] = 'df4050485133'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.alter_column(
        'moves',
        'player_id',
        existing_type=sa.UUID(),
        nullable=True,
    )

    op.create_table(
        'payments',
        sa.Column('match_id', sa.UUID(), nullable=False),
        sa.Column('onchain_match_id', sa.BigInteger(), nullable=False),
        sa.Column('escrow_address', sa.String(length=72), nullable=False),
        sa.Column('stake', sa.Numeric(precision=18, scale=8), nullable=False),
        sa.Column(
            'status',
            sa.Enum('WAITING', 'ACTIVE', 'RESOLVED', 'CANCELLED', name='escrowstatus'),
            nullable=False,
        ),
        sa.Column('create_tx_hash', sa.String(length=64), nullable=True),
        sa.Column('resolve_tx_hash', sa.String(length=64), nullable=True),
        sa.Column('winner_id', sa.UUID(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['match_id'], ['matches.id']),
        sa.ForeignKeyConstraint(['winner_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('match_id'),
        sa.UniqueConstraint('onchain_match_id'),
    )

    op.create_table(
        'fingerprints',
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('games_analyzed', sa.Integer(), nullable=False),
        sa.Column('avg_acpl', sa.Float(), nullable=False),
        sa.Column('acpl_stddev', sa.Float(), nullable=False),
        sa.Column('avg_move_time_ms', sa.Float(), nullable=False),
        sa.Column('move_time_stddev_ms', sa.Float(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )

    op.create_table(
        'anti_cheat_logs',
        sa.Column('game_id', sa.UUID(), nullable=False),
        sa.Column('player_id', sa.UUID(), nullable=False),
        sa.Column('acpl', sa.Float(), nullable=False),
        sa.Column('avg_move_time_ms', sa.Float(), nullable=False),
        sa.Column('timing_cv', sa.Float(), nullable=False),
        sa.Column('flagged', sa.Boolean(), nullable=False),
        sa.Column('reason', sa.String(length=255), nullable=True),
        sa.Column('trust_score_before', sa.Float(), nullable=False),
        sa.Column('trust_score_after', sa.Float(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['game_id'], ['games.id']),
        sa.ForeignKeyConstraint(['player_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_table('anti_cheat_logs')
    op.drop_table('fingerprints')
    op.drop_table('payments')

    op.alter_column(
        'moves',
        'player_id',
        existing_type=sa.UUID(),
        nullable=False,
    )
