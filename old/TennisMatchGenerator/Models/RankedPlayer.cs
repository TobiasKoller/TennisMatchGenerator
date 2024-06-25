namespace TennisMatchGenerator.Models
{
    public class RankedPlayer : ModelBase
    {
        public int Position { get; set; }
        public required Player Player { get; set; }
    }
}
