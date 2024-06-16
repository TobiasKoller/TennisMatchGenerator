using TennisMatchGenerator.Models;
using TennisMatchGenerator.Models.Constants;

namespace TennisMatchGenerator.Repositories
{
    public class SettingRepository : RepositoryBase
    {
        public SettingRepository() : base(DatabaseCollections.Setting) 
        { 
        
        }

        public Setting Get()
        {
            return GetAll<Setting>().FirstOrDefault();
        }
    }
}
