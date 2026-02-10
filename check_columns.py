import pandas as pd
import os

base_dir = r"G:\Workspace\screen-size-checker\docs\GSC数据"
file_28 = os.path.join(base_dir, "gsc 28天数据.xlsx")

try:
    xls = pd.ExcelFile(file_28)
    print("Sheet names:", xls.sheet_names)
    for sheet in xls.sheet_names:
        df = pd.read_excel(xls, sheet, nrows=1)
        print(f"Columns in {sheet}: {list(df.columns)}")
except Exception as e:
    print(f"Error: {e}")
