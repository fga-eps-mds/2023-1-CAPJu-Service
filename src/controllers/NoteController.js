import Note from "../models/Note.js";

class NoteController {
  index = async (req, res) => {
    const record = req.params.record;
    try {
      const note = await Note.findAll({ where: { record } });
      return res.status(200).json(note);
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Erro ao buscar observação: ${error}` });
    }
  };

  newNote = async (req, res) => {
    const { commentary, record, idStageA, idStageB } = req.body;
    try {
      const note = await Note.create({
        commentary,
        record,
        idStageA,
        idStageB,
      });
      return res.status(200).json(note);
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Erro ao criar observação: ${error}` });
    }
  };

  delete = async (req, res) => {
    const { idNote } = req.params;
    try {
      const note = await Note.findByPk(idNote);
      if (!note) {
        return res.status(400).json({ error: `idNote ${idNote} não existe!` });
      } else {
        await note.destroy();
        return res
          .status(200)
          .json({ message: "Observação deletada com sucesso." });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Erro ao deletar observação: ${error}` });
    }
  };

  update = async (req, res) => {
    const { commentary } = req.body;
    const { idNote } = req.params;

    try {
      const note = await Note.findByPk(idNote);
      if (!note) {
        return res.status(400).json({ error: `idNote ${idNote} não existe!` });
      } else {
        note.set({ commentary });
        await note.save();
        return res
          .status(200)
          .json({ message: "Observação atualizada com sucesso." });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Erro ao atualizar observação: ${error}` });
    }
  }
}

export default new NoteController();
