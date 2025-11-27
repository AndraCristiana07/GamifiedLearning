using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gamified_learning.Migrations
{
    /// <inheritdoc />
    public partial class AddHints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HintPenalty",
                table: "Challenges",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HintsJson",
                table: "Challenges",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HintPenalty",
                table: "Challenges");

            migrationBuilder.DropColumn(
                name: "HintsJson",
                table: "Challenges");
        }
    }
}
