using TennisMatchGenerator.Models.Constants;

namespace TennisMatchGenerator.Repositories
{
    public class RankingRepository : RepositoryBase
    {
        public RankingRepository() : base(DatabaseCollections.Ranking) { }
    }
}
