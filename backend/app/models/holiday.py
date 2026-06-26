from sqlalchemy import Column, Integer, String, DateTime, Date, Boolean
from datetime import datetime, timezone
from app.core.database import Base


class ColombianHoliday(Base):
    __tablename__ = "colombian_holidays"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50))  # national, civic, religious
    is_recurring = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# Festivos de Colombia 2024-2026 (se pueden cargar desde un JSON o seed)
COLOMBIAN_HOLIDAYS_DATA = [
    # 2024
    {"date": "2024-01-01", "name": "Año Nuevo", "type": "national"},
    {"date": "2024-01-08", "name": "Día de los Reyes Magos", "type": "religious"},
    {"date": "2024-03-25", "name": "Día de San José", "type": "religious"},
    {"date": "2024-03-28", "name": "Jueves Santo", "type": "religious"},
    {"date": "2024-03-29", "name": "Viernes Santo", "type": "religious"},
    {"date": "2024-05-01", "name": "Día del Trabajo", "type": "national"},
    {"date": "2024-05-13", "name": "Ascensión del Señor", "type": "religious"},
    {"date": "2024-06-03", "name": "Corpus Christi", "type": "religious"},
    {"date": "2024-06-10", "name": "Sagrado Corazón", "type": "religious"},
    {"date": "2024-06-29", "name": "San Pedro y San Pablo", "type": "religious"},
    {"date": "2024-07-20", "name": "Día de la Independencia", "type": "national"},
    {"date": "2024-08-07", "name": "Batalla de Boyacá", "type": "national"},
    {"date": "2024-08-15", "name": "Asunción de la Virgen", "type": "religious"},
    {"date": "2024-10-14", "name": "Día de la Raza", "type": "national"},
    {"date": "2024-11-01", "name": "Día de los Santos", "type": "religious"},
    {"date": "2024-11-11", "name": "Independencia de Cartagena", "type": "national"},
    {"date": "2024-12-08", "name": "Inmaculada Concepción", "type": "religious"},
    {"date": "2024-12-25", "name": "Navidad", "type": "national"},
    
    # 2025
    {"date": "2025-01-01", "name": "Año Nuevo", "type": "national"},
    {"date": "2025-01-06", "name": "Día de los Reyes Magos", "type": "religious"},
    {"date": "2025-03-24", "name": "Día de San José", "type": "religious"},
    {"date": "2025-04-17", "name": "Jueves Santo", "type": "religious"},
    {"date": "2025-04-18", "name": "Viernes Santo", "type": "religious"},
    {"date": "2025-05-01", "name": "Día del Trabajo", "type": "national"},
    {"date": "2025-06-02", "name": "Ascensión del Señor", "type": "religious"},
    {"date": "2025-06-23", "name": "Corpus Christi", "type": "religious"},
    {"date": "2025-06-30", "name": "Sagrado Corazón", "type": "religious"},
    {"date": "2025-06-29", "name": "San Pedro y San Pablo", "type": "religious"},
    {"date": "2025-07-20", "name": "Día de la Independencia", "type": "national"},
    {"date": "2025-08-07", "name": "Batalla de Boyacá", "type": "national"},
    {"date": "2025-08-15", "name": "Asunción de la Virgen", "type": "religious"},
    {"date": "2025-10-13", "name": "Día de la Raza", "type": "national"},
    {"date": "2025-11-01", "name": "Día de los Santos", "type": "religious"},
    {"date": "2025-11-11", "name": "Independencia de Cartagena", "type": "national"},
    {"date": "2025-12-08", "name": "Inmaculada Concepción", "type": "religious"},
    {"date": "2025-12-25", "name": "Navidad", "type": "national"},

    # 2026
    {"date": "2026-01-01", "name": "Año Nuevo", "type": "national"},
    {"date": "2026-01-12", "name": "Día de los Reyes Magos", "type": "religious"},
    {"date": "2026-03-23", "name": "Día de San José", "type": "religious"},
    {"date": "2026-04-02", "name": "Jueves Santo", "type": "religious"},
    {"date": "2026-04-03", "name": "Viernes Santo", "type": "religious"},
    {"date": "2026-05-01", "name": "Día del Trabajo", "type": "national"},
    {"date": "2026-05-18", "name": "Ascensión del Señor", "type": "religious"},
    {"date": "2026-06-08", "name": "Corpus Christi", "type": "religious"},
    {"date": "2026-06-15", "name": "Sagrado Corazón", "type": "religious"},
    {"date": "2026-06-29", "name": "San Pedro y San Pablo", "type": "religious"},
    {"date": "2026-07-20", "name": "Día de la Independencia", "type": "national"},
    {"date": "2026-08-07", "name": "Batalla de Boyacá", "type": "national"},
    {"date": "2026-08-17", "name": "Asunción de la Virgen", "type": "religious"},
    {"date": "2026-10-12", "name": "Día de la Raza", "type": "national"},
    {"date": "2026-11-02", "name": "Día de los Santos", "type": "religious"},
    {"date": "2026-11-16", "name": "Independencia de Cartagena", "type": "national"},
    {"date": "2026-12-08", "name": "Inmaculada Concepción", "type": "religious"},
    {"date": "2026-12-25", "name": "Navidad", "type": "national"},
]
