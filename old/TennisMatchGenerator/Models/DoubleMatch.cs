namespace TennisMatchGenerator.Models
{
    public class DoubleMatch : Match
    {
        public override GameType GameType { get => GameType.Double; }
        public required List<Player> Players1 { get; set; }
        public required List<Player> Players2 { get; set; }
    }
}
