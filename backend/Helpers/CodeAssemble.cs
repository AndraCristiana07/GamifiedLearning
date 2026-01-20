namespace Gamified_learning.Helpers {
    public static class CodeAssemble
    {
        public static string AssembleCode(string userCode, string wrapperCode)
        {
            if (string.IsNullOrEmpty(wrapperCode))
                throw new Exception("Wrapper code is empty");
            if (string.IsNullOrEmpty(userCode))
                throw new Exception("User code is empty");
            Console.WriteLine("Assembling code...");
            Console.WriteLine($"User code: {userCode}");
            Console.WriteLine($"Wrapper code: {wrapperCode}");
            return userCode + "\n" + wrapperCode;
        }
    }
}