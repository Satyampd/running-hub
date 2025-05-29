from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String as SAString
import uuid

MiniBase = declarative_base()

class TestDefaultModel(MiniBase):
    __tablename__ = "test_default_model_minimal"
    id = Column(Integer, primary_key=True)
    data = Column(SAString, default="default_value")
    counter = Column(Integer, default=lambda: 100)
    uid = Column(SAString, default=lambda: str(uuid.uuid4()))

def test_minimal_standalone_model_defaults():
    """Test if a standalone simple model respects client-side defaults in a minimal file."""
    instance = TestDefaultModel()
    assert instance.data == "default_value"
    assert instance.counter == 100
    assert isinstance(uuid.UUID(instance.uid), uuid.UUID)

    instance_with_data = TestDefaultModel(data="custom_value", counter=50, uid="custom_uid")
    assert instance_with_data.data == "custom_value"
    assert instance_with_data.counter == 50
    assert instance_with_data.uid == "custom_uid" 