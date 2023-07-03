import Note from "../models/Notes.js";

class NoteController {
  index = async (req, res) => {
    const { record } = req.params;
    try {
      const note = await Note.findOne({ where: { record } });
      if (note) {
        return res.status(200).json(note);
      } else {
        return res
          .status(204)
          .json({ message: 'Nenhuma observação encontrada.' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar obervação.' });
    }
  };
}

export default new NoteController();
