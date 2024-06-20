using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TennisMatchGenerator.Models
{
    public class Player : ModelBase
    {
        private string _firstName="";
        private string _lastName="";
        public string FirstName { get { return _firstName; } set { _firstName = value; SetFullName(); } }
        public string LastName { get { return _lastName; } set { _lastName = value; SetFullName(); } }
        public string FullName { get; set; } = "";
        public DateTime BirthDate { get; set; }
        public double LK { get; set; } = 25;
        public decimal TotalPoints { get; set; }
        public ObservableCollection<Achievement> Achievements { get; set; }

        private void SetFullName()
        {
            FullName = $"{FirstName} {LastName}";
        }

        public Player()
        {
            Achievements = [];
            Achievements.CollectionChanged += (sender, args) =>
            {
                RecalculatePoints();
            };
        }

        private void RecalculatePoints()
        {
            TotalPoints = Achievements?.Sum(a => a.Points) ?? 0;
        }
    }
}
