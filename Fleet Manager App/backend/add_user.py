from sqlalchemy.orm import Session
from main import SessionLocal, User, get_password_hash


def add_user(username: str, password: str):
    """
    Adds a new user to the database.

    This function checks if the user already exists, hashes the password,
    creates a new User instance, and commits it to the database.

    Args:
        username (str): The username for the new user.
        password (str): The password for the new user.

    Returns:
        None: Prints success or error messages.
    """
    db: Session = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            print(f"User '{username}' already exists.")
            return

        # Hash the password
        hashed_password = get_password_hash(password)

        # Create new user
        new_user = User(username=username, hashed_password=hashed_password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"User '{username}' added successfully with ID {new_user.id}.")
    except Exception as e:
        db.rollback()
        print(f"Error adding user: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    """
    Entry point for the script.
    Adds a sample user when run directly.
    """
    add_user("tebogo@gmail.com", "tebogo")
