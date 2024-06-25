using TennisMatchGenerator.Models.Constants;

namespace TennisMatchGenerator.Repositories
{
    public class MatchDayRepository : RepositoryBase 
    {
        public MatchDayRepository() : base(DatabaseCollections.MatchDay) { }
    }
}
