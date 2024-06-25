using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TennisMatchGenerator.Models
{
    public class Achievement : ModelBase
    {
        public AchievementType Type {get;set;}
        public DateTime Date { get; set;}
        public decimal Points { get; set;}
    }
}
