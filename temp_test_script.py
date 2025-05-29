from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String

MiniBase = declarative_base()

class MyModel(MiniBase):
    __tablename__ = 'test_table'
    id = Column(Integer, primary_key=True)
    data = Column(String, default='default_value_works')

instance = MyModel()
print(f"Instance data: {instance.data}")
assert instance.data == 'default_value_works'
print("Assertion passed: SQLAlchemy default works in isolated venv.") 