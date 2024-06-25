using TennisMatchGenerator.Repositories;

namespace TennisMatchGenerator.Services
{

    public class ServiceBase<T> : IService where T : IRepository
    {
        protected T Repository { get; set; }
        public ServiceBase(T repository)
        {
            Repository = repository;
        }
    }

}
