import pandas as pd
import os

# Paths
base_dir = r"G:\Workspace\screen-size-checker\docs\GSC数据"
file_28 = os.path.join(base_dir, "gsc 28天数据.xlsx")
file_90 = os.path.join(base_dir, "gsc 90天数据.xlsx")

# Column Mapping
QUERY_COLS = {
    '热门查询': 'Query',
    '点击次数': 'Clicks',
    '展示': 'Impressions',
    '点击率': 'CTR',
    '排名': 'Position'
}
PAGE_COLS = {
    '排名靠前的网页': 'Page',
    '点击次数': 'Clicks',
    '展示': 'Impressions',
    '点击率': 'CTR',
    '排名': 'Position'
}

def load_sheet(filepath, sheet_name, col_map):
    try:
        df = pd.read_excel(filepath, sheet_name)
        df = df.rename(columns=col_map)
        
        # Clean numeric columns
        for col in ['Clicks', 'Impressions', 'Position']:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
        # Clean CTR
        if df['CTR'].dtype == object:
             df['CTR'] = df['CTR'].astype(str).str.rstrip('%').astype('float') / 100.0
             
        return df
    except Exception as e:
        print(f"Error loading {sheet_name} from {filepath}: {e}")
        return None

def analyze_queries(df, period_label):
    print(f"\n=== Query Analysis ({period_label}) ===")
    
    # 1. High Potential (Imp > 500, Pos 5-20)
    high_pot = df[(df['Impressions'] > 500) & (df['Position'] >= 5) & (df['Position'] <= 20)]
    print(f"\n[High Potential Keywords] (Imp>500, Pos 5-20) - Count: {len(high_pot)}")
    if not high_pot.empty:
        print(high_pot.sort_values('Impressions', ascending=False).head(10).to_string(index=False))

    # 2. Striking Distance (Pos 11-30)
    striking = df[(df['Position'] >= 11) & (df['Position'] <= 30)]
    print(f"\n[Striking Distance] (Pos 11-30) - Count: {len(striking)}")
    if not striking.empty:
        print(striking.sort_values('Impressions', ascending=False).head(10).to_string(index=False))

    # 3. High Volume Low CTR (Imp > 1000, CTR < 1%)
    low_ctr = df[(df['Impressions'] > 1000) & (df['CTR'] < 0.01)]
    print(f"\n[High Volume Low CTR] (Imp>1000, CTR<1%) - Count: {len(low_ctr)}")
    if not low_ctr.empty:
        print(low_ctr.sort_values('Impressions', ascending=False).head(10).to_string(index=False))

    # 4. Top Keywords
    print(f"\n[Top 10 Keywords by Clicks]")
    print(df.sort_values('Clicks', ascending=False).head(10).to_string(index=False))

def analyze_pages(df, period_label):
    print(f"\n=== Page Analysis ({period_label}) ===")
    
    # 1. Top Pages
    print(f"\n[Top 10 Pages by Clicks]")
    print(df.sort_values('Clicks', ascending=False).head(10).to_string(index=False))

    # 2. Sleeping Pages (Imp > 500, Clicks < 5)
    sleeping = df[(df['Impressions'] > 500) & (df['Clicks'] < 5)]
    print(f"\n[Sleeping Pages] (Imp>500, Clicks<5) - Count: {len(sleeping)}")
    if not sleeping.empty:
        print(sleeping.sort_values('Impressions', ascending=False).head(10).to_string(index=False))

    # 3. Low CTR Pages (Imp > 1000, CTR < 1.5%)
    low_ctr = df[(df['Impressions'] > 1000) & (df['CTR'] < 0.015)]
    print(f"\n[Low CTR Pages] (Imp>1000, CTR<1.5%) - Count: {len(low_ctr)}")
    if not low_ctr.empty:
        print(low_ctr.sort_values('Impressions', ascending=False).head(10).to_string(index=False))

def main():
    # 28 Days
    print("Loading 28 Days Data...")
    q28 = load_sheet(file_28, '查询数', QUERY_COLS)
    p28 = load_sheet(file_28, '网页', PAGE_COLS)
    
    if q28 is not None: analyze_queries(q28, "28 Days")
    if p28 is not None: analyze_pages(p28, "28 Days")

    # 90 Days
    print("\nLoading 90 Days Data...")
    q90 = load_sheet(file_90, '查询数', QUERY_COLS)
    p90 = load_sheet(file_90, '网页', PAGE_COLS)
    
    if q90 is not None: analyze_queries(q90, "90 Days")
    if p90 is not None: analyze_pages(p90, "90 Days")

if __name__ == "__main__":
    main()