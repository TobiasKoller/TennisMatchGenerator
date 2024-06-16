namespace TennisMatchGenerator.Models
{
    public class SingleMatch : Match
    {
        public override GameType GameType { get => GameType.Single; }
        public required Player Player1 { get; set; }
        public required Player Player2 { get; set; }
    }
}
