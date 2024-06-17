using TennisMatchGenerator.Models;
using TennisMatchGenerator.Repositories;

namespace TennisMatchGenerator.Services
{
    public class SettingService : ServiceBase<SettingRepository>
    {
        public SettingService(SettingRepository repository) : base(repository) { }

        public Setting Get()
        {
            var all = Repository.GetAll<Setting>();
            if (!all.Any())
            {
                var settings = new Setting();
                Repository.Create(settings);
                return settings;
            }
            return all.First();
        }

        public bool Update(Setting settings)
        {
            return Repository.Update(settings);
        }
    }
}
