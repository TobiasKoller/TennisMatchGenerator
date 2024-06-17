namespace TennisMatchGenerator.Models
{
    public abstract class Match : ModelBase
    {
        public int CourtNo { get; set; }
        public abstract GameType GameType { get; }
    }
}
