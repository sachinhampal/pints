import database as _db
import sqlalchemy as _s
import sqlalchemy.orm as _so
import sqlmodel as _sm


# ================================================================================
# SQL model tables
# ================================================================================


class FriendPintRecord(_db.Base):
    __tablename__ = "friend_pint_record"

    pint_record_id: _so.Mapped[int] = _so.mapped_column(
        _s.ForeignKey("pint_record.id_"), primary_key=True
    )
    friend_name: _so.Mapped[str] = _so.mapped_column(
        _s.ForeignKey("friend.name"), primary_key=True
    )
    pint_record: _so.Mapped["PintRecord"] = _so.relationship(
        back_populates="friend_pint_record"
    )
    friend: _so.Mapped["Friend"] = _so.relationship(back_populates="friend_pint_record")


class Friend(_db.Base):
    __tablename__ = "friend"

    name: _so.Mapped[str] = _so.mapped_column(
        nullable=False, primary_key=True, index=True
    )
    total_pint_count: _so.Mapped[float | None] = _so.mapped_column(default=None)
    friend_pint_record: _so.Mapped[list["FriendPintRecord"]] = _so.relationship(
        back_populates="friend"
    )


class PintRecord(_db.Base):
    __tablename__ = "pint_record"

    id_: _so.Mapped[int | None] = _so.mapped_column(primary_key=True)
    total_cost: _so.Mapped[float | None] = _so.mapped_column(default=None)
    comment: _so.Mapped[str | None] = _so.mapped_column(default=None)
    date: _so.Mapped[str] = _so.mapped_column(nullable=False)
    location: _so.Mapped[str] = _so.mapped_column(nullable=False)
    number: _so.Mapped[float] = _so.mapped_column(nullable=False)
    pint_brand: _so.Mapped[str | None] = _so.mapped_column(default=None)
    pint_cost: _so.Mapped[float | None] = _so.mapped_column(default=None)
    friend_pint_record: _so.Mapped[list["FriendPintRecord"]] = _so.relationship(
        back_populates="pint_record"
    )
