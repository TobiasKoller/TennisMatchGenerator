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
#if DEBUG
                    var cwd = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
                    if (Path.GetFileName(cwd) == "AppX") cwd = Path.Combine(cwd,"..","..","..","..","..","db");
                    _instance = new LiteDatabase(Path.Combine(cwd, "data.db"));
#else
                    var cwd = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
                    _instance = new LiteDatabase(Path.Combine(cwd, "db", "data.db"));
#endif
                }
                return _instance;
                
            }
        }
    }
}
