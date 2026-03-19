import streamlit as st
import mysql.connector
import hashlib
import time
import subprocess
import webbrowser

# ----------------- MYSQL CONNECTION -----------------
def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="autism_db"
    )

# ----------------- SECURITY -----------------
def make_hashes(password):
    return hashlib.sha256(password.encode()).hexdigest()

def check_hashes(password, hashed_text):
    if make_hashes(password) == hashed_text:
        return hashed_text
    return False

# ----------------- DATABASE -----------------
def create_usertable():
    conn = get_connection()
    c = conn.cursor()
    c.execute('CREATE TABLE IF NOT EXISTS userstable(username VARCHAR(100), password VARCHAR(200))')
    conn.commit()
    conn.close()

def add_userdata(username, password):
    conn = get_connection()
    c = conn.cursor()
    c.execute('INSERT INTO userstable(username, password) VALUES (%s, %s)', (username, password))
    conn.commit()
    conn.close()

def login_user(username, password):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM userstable WHERE username = %s AND password = %s', (username, password))
    data = c.fetchall()
    conn.close()
    return data

def view_all_users():
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM userstable')
    data = c.fetchall()
    conn.close()
    return data

# ----------------- STREAMLIT UI -----------------
st.set_page_config(page_title="Login/Register", layout="wide")
st.title("🚀 Autism Predictor - Login/Register Page")

menu = ["Login", "Register"]
choice = st.sidebar.selectbox("Menu", menu)

if choice == "Register":
    st.subheader("Create New Account")
    new_user = st.text_input("Username")
    new_password = st.text_input("Password", type='password')

    if st.button("Signup"):
        create_usertable()
        hashed_new_password = make_hashes(new_password)
        add_userdata(new_user, hashed_new_password)
        st.success("You have successfully created an account!")
        st.info("Go to Login Menu to login")

elif choice == "Login":
    st.subheader("Login to your Account")
    username = st.text_input("Username")
    password = st.text_input("Password", type='password')

    if st.button("Login"):
        create_usertable()
        hashed_password = make_hashes(password)
        result = login_user(username, hashed_password)

        if result:
            st.success(f"Logged in as {username}")
            st.info("Launching Autism Predictor...")

            # Launch Flask app
            subprocess.Popen(["python", "autism.py"])
            time.sleep(3)  # give Flask some time to start
            webbrowser.open_new("http://localhost:5000")
        else:
            st.error("Incorrect Username/Password")
