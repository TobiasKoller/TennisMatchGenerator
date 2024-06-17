using LiteDB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace TennisMatchGenerator.Repositories
{
    public class Database
    {
        private static LiteDatabase _instance;

        private Database()
        {
        }

        public static LiteDatabase Instance
        {
            get
            {
                if (_instance == null)
                {
                    //var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                    //var appData = FileSystem.Current.AppDataDirectory;
                    var appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    var path = Path.Combine(appData, "TennisMatchGenerator");
                    if (!Directory.Exists(path)) Directory.CreateDirectory(path);

                    _instance = new LiteDatabase(Path.Combine(path,"TennisMatchGenerator.db"));
                }
                return _instance;
                
            }
        }
    }
}
