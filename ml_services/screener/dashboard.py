# dashboard.py
import streamlit as st
import pandas as pd
import mysql.connector
from mysql.connector import Error

st.set_page_config(page_title="Autism Prediction Dashboard", layout="wide")

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",   # change if needed
        password="",   # change if needed
        database="autism_db"
    )

def load_data():
    try:
        conn = get_connection()
        df = pd.read_sql("SELECT * FROM autism_predictions", conn)
        conn.close()
        return df
    except Error as e:
        st.error(f"Database error: {e}")
        return pd.DataFrame()

st.title("Autism Prediction Dashboard")

df = load_data()

if df.empty:
    st.warning("No data available. Make predictions from the app first.")
else:
    # Normalize older labels if present
    sex_mapping = {1: 'Male', 0: 'Female'}
    
    # The .map() function applies the dictionary.
    # .fillna(df['sex']) ensures that if a value is not in the map (e.g., "Other"),
    # it remains unchanged instead of becoming blank.
    df['sex'] = df['sex'].map(sex_mapping).fillna(df['sex'])
    mapping = {
        "Autistic": "High Risk",
        "Not Autistic": "No Autism",
        "YES": "High Risk",
        "NO": "No Autism"
    }
    df['result_normalized'] = df['result'].replace(mapping).fillna(df['result'])

    counts = df['result_normalized'].value_counts().reindex(["No Autism", "Medium Risk", "High Risk"], fill_value=0)

    # Top metrics
    c1, c2, c3, c4 = st.columns([1,1,1,1])
    c1.metric("Total predictions", len(df))
    c2.metric("No Autism", int(counts["No Autism"]))
    c3.metric("Medium Risk", int(counts["Medium Risk"]))
    c4.metric("High Risk", int(counts["High Risk"]))

    st.markdown("---")
    st.subheader("Distribution")
    st.bar_chart(counts)

    st.subheader("Filter & Recent entries")
    with st.expander("Filter results"):
        risk_options = ["All"] + sorted(df['result_normalized'].unique().tolist())
        selected = st.selectbox("Show predictions for", risk_options)
        if selected == "All":
            df_filtered = df.copy()
        else:
            df_filtered = df[df['result_normalized'] == selected]

        st.write(f"Showing {len(df_filtered)} rows")
        st.dataframe(df_filtered.reset_index(drop=True))

        csv = df_filtered.to_csv(index=False).encode('utf-8')
        st.download_button("Download filtered CSV", data=csv, file_name="autism_predictions_filtered.csv", mime="text/csv")

    st.markdown("---")
    st.subheader("Recent Entries")
    st.dataframe(df.sort_index(ascending=False).head(10).reset_index(drop=True))

    st.markdown("**Notes & Tips**")
    st.write("""
    - The dashboard uses the `result` saved from the prediction endpoint.
    - If you retrain your model and change labels, make sure to update the mapping logic.
    - If you want additional analytics (age distribution, sex split, family history correlation), tell me which charts you'd like and I'll add them.
    """)

