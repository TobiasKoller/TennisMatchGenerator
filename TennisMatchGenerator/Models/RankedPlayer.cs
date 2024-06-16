namespace TennisMatchGenerator.Models
{
    public class RankedPlayer
    {
        public int Position { get; set; }
        public required Player Player { get; set; }
    }
}
