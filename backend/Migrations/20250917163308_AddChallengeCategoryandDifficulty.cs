using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gamified_learning.Migrations
{
    /// <inheritdoc />
    public partial class AddChallengeCategoryandDifficulty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Challenges",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "Challenges",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Challenges");

            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "Challenges");
        }
    }
}
