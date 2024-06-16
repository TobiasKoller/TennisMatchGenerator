namespace TennisMatchGenerator.Models
{
    public class MatchDay
    {
        public MatchDay()
        {
            AvailablePlayers = new List<Player>();
            Matches = new List<Match>();
        }
        public List<Player> AvailablePlayers { get; set; }
        public List<Match> Matches { get; set; }
    }
}
