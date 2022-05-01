import geopandas
import pandas
import sqlite3

def get_agency_geo(raw, db): 
    list = raw.split(', ')
    string = ','.join(map("'{0}'".format, list))
    if raw: 
        query = '''
            SELECT 
                "Agency",
                "Address",
                "County",
                "Latitude",
                "Longitude",
                "Email",
                "Phone",
                "Website"
            FROM "Agency GPS" WHERE Agency IN ({})
            '''.format(string)
        df = pandas.read_sql(query, db)
        gdf = geopandas.GeoDataFrame(df, geometry=geopandas.points_from_xy(df.Longitude, df.Latitude))
        geojson = gdf.to_json()
        return geojson
    else:   
        return


def load_data():
    dfs = pandas.read_excel('process/input/Counties_Actions_May1.xlsx', sheet_name=None)
    db = sqlite3.connect(':memory:')
    for table, df in dfs.items():
        df.to_sql(table, db)    
    df_actions = pandas.read_sql_query('''
        select "Date(s)",
        "County",
        "Action # (start date + letter to separate shared start dates)",
        "Lat",
        "Lon",
        "Main Group",
        "Arrest / Cite",
        "Description",
        "Agencies",
        "MTBS Images",
        "Extra Links" from Actions where Lat NOT NULL and Agencies NOT NULL'''
        , db)
    df_actions['agency_geojson'] = df_actions.apply(lambda x: get_agency_geo(x.Agencies, db), axis=1)
    gdf_actions = geopandas.GeoDataFrame(df_actions, geometry=geopandas.points_from_xy(df_actions.Lon, df_actions.Lat))
    gdf_actions.to_file("process/output/actions_with_agencies.json", driver="GeoJSON")

load_data()