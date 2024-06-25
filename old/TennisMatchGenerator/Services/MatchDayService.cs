using TennisMatchGenerator.Models;
using TennisMatchGenerator.Repositories;

namespace TennisMatchGenerator.Services
{
    public class MatchDayService : ServiceBase<MatchDayRepository>
    {
        public MatchDayService(MatchDayRepository repository) : base(repository) { }



    }
}
