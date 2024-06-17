using CommunityToolkit.Mvvm.ComponentModel;

namespace TennisMatchGenerator.Models
{
    public abstract class ModelBase : ObservableObject
    {
        public Guid Id { get; set; }
    }
}
