from passlib.context import CryptContext

# Use bcrypt for hashing
pwd_context = CryptContext(schemes=["argon2","bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checking if the plain password matches the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generating a secure hash for a password."""
    return pwd_context.hash(password)

# --- THIS TO HASH MY PASSWORDS ---

# Hash any new passwords and update the hashed string into the database

print("Hashed ir\n", get_password_hash("my password"))
print("Validating for ir :", verify_password('my password',(get_password_hash("my password"))))

# sql for pgAdmin
# UPDATE admin_users SET password = '$argon2id$v=19$m=65536,t=3,p=4$OafUmlMqBaA0hrA8BmDMeQ$K+E6KSjYbRl/hTP6givtAjwkZwfoas1GaA4EJ4dAEjc' WHERE username = 'irfan';  // Nah kiddo this is sample hased password