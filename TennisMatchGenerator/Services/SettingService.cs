using TennisMatchGenerator.Models;
using TennisMatchGenerator.Repositories;

namespace TennisMatchGenerator.Services
{
    public class SettingService : ServiceBase<SettingRepository>
    {
        public SettingService(SettingRepository repository) : base(repository) { }

        public Setting Get()
        {
            return Repository.Get() ?? new Setting();
        }
    }
}
