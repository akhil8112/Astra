import pandas as pd

# Load dataset
file_path = "Dataset_Autism.xlsx"
df = pd.read_excel(file_path)

# Filter only ages 1–19
df_filtered = df[(df["Age"] >= 1) & (df["Age"] <= 19)]

# Save cleaned dataset
df_filtered.to_excel("Clean_Dataset_Autism.xlsx", index=False)

print("Original size:", len(df))
print("Filtered size:", len(df_filtered))
