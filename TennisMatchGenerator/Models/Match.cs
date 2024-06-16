namespace TennisMatchGenerator.Models
{
    public abstract class Match
    {
        public int CourtNo { get; set; }
        public abstract GameType GameType { get; }
    }
}
