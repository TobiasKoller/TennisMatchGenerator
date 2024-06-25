using TennisMatchGenerator.Repositories;

namespace TennisMatchGenerator.Services
{
    public class RankingService : ServiceBase<RankingRepository>
    {
        public RankingService(RankingRepository repository) : base(repository) { }
    }

}
